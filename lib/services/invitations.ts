// lib/invitation-utils.ts
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/lib/config/firebase";
import { Invitation } from "@/lib/models/invitation";

/**
 * Helper: find user document by email.
 * Returns { id, data } or null.
 */
export async function findUserByEmail(email: string) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, data: docSnap.data() };
}

/**
 * Send invitation:
 * - verifies recipient exists
 * - writes the same invitation doc to:
 *   users/{senderId}/invitationsSent/{invId}
 *   users/{recipientId}/invitationsReceived/{invId}
 *   invitations/{invId} (top-level)  (optional, helpful for admin)
 */
export async function sendInvitation({
  meetupId,
  meetupTitle,
  destination,
  dateTime,
  senderId,
  senderName,
  senderEmail,
  recipientEmail,
}: {
  meetupId: string;
  meetupTitle: string;
  destination: any;
  dateTime: string | Date;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
}) {
  // Find recipient by email
  const found = await findUserByEmail(recipientEmail.toLowerCase());
  if (!found) {
    throw new Error("User not found");
  }
  const recipientId = found.id;
  const recipientName = (found.data as any).name || "";

  // Create a consistent docRef id for all writes
  const sentRef = doc(collection(db, "users", senderId, "invitationsSent"));
  const inviteId = sentRef.id;

  const invitation: Omit<Invitation, "id"> & { sentAt: any } = {
    meetupId,
    meetupTitle,
    destination,
    dateTime: typeof dateTime === "string" ? dateTime : (dateTime as Date).toISOString(),
    senderId,
    senderName,
    senderEmail,
    recipientId,
    recipientEmail: recipientEmail.toLowerCase(),
    recipientName,
    status: "pending",
    sentAt: serverTimestamp(), // store a Firestore Timestamp
  };

  // Batch write to ensure both subcollections are written
  const batch = writeBatch(db);
  const senderInvRef = doc(db, "users", senderId, "invitationsSent", inviteId);
  const recipientInvRef = doc(db, "users", recipientId, "invitationsReceived", inviteId);
  const topLevelRef = doc(db, "invitations", inviteId);

  batch.set(senderInvRef, { id: inviteId, ...invitation });
  batch.set(recipientInvRef, { id: inviteId, ...invitation });
  batch.set(topLevelRef, { id: inviteId, ...invitation });

  await batch.commit();
  return inviteId;
}

/**
 * Fetch invitations for a user: merges received + sent
 * Converts Timestamp fields to ISO strings
 */
export async function fetchInvitations(userId: string): Promise<Invitation[]> {
  try {
    const receivedSnap = await getDocs(collection(db, "users", userId, "invitationsReceived"));
    const sentSnap = await getDocs(collection(db, "users", userId, "invitationsSent"));

    const normalize = (d: any) => {
      // d may contain sentAt as Timestamp
      if (d.sentAt && d.sentAt.toDate) d.sentAt = d.sentAt.toDate().toISOString();
      if (d.respondedAt && d.respondedAt.toDate) d.respondedAt = d.respondedAt.toDate().toISOString();
      return d as Invitation;
    };

    const received = receivedSnap.docs.map((s) => normalize({ id: s.id, ...s.data() }));
    const sent = sentSnap.docs.map((s) => normalize({ id: s.id, ...s.data() }));

    return [...received, ...sent];
  } catch (err) {
    console.error("fetchInvitations error:", err);
    return [];
  }
}

/**
 * Accept invitation:
 * - update invitation.status to "accepted" in recipient's received, sender's sent, and top-level
 * - add recipient to meetup.memberIds and meetup.members map
 * - add meetupId to user's meetupIds array
 */
export async function acceptInvitation({
  recipientId,
  invitationId,
}: {
  recipientId: string;
  invitationId: string;
}) {
  try {
    // 🔍 DEBUG LOGS
    console.log("🔍 Accepting invitation:", { recipientId, invitationId });
    console.log("🔍 Current auth user:", auth.currentUser?.uid);
    console.log("🔍 Match?", auth.currentUser?.uid === recipientId);

    // Load recipient invitation doc
    const recRef = doc(db, "users", recipientId, "invitationsReceived", invitationId);
    const recSnap = await getDoc(recRef);
    if (!recSnap.exists()) {
      throw new Error("Invitation not found");
    }
    const inv = recSnap.data() as any;
    const meetupId = inv.meetupId;
    const senderId = inv.senderId;

    console.log("🔍 Invitation data:", { meetupId, senderId });

    // batch updates for consistency
    const batch = writeBatch(db);

    // update recipient received invite
    batch.update(recRef, {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });

    // update sender's copy
    const senderRef = doc(db, "users", senderId, "invitationsSent", invitationId);
    batch.update(senderRef, {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });

    // update top-level invitation
    const topRef = doc(db, "invitations", invitationId);
    batch.update(topRef, {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });

    // add recipient to meetup member arrays and members map
    const meetupRef = doc(db, "meetups", meetupId);
    batch.update(meetupRef, {
      memberIds: arrayUnion(recipientId),
      [`members.${recipientId}`]: {
        joinedAt: serverTimestamp(),
        arrivedAt: null,
        locationSharingEnabled: false,
      },
    });

    // add meetup id to user's meetupIds
    const userRef = doc(db, "users", recipientId);
    batch.update(userRef, {
      meetupIds: arrayUnion(meetupId),
    });

    console.log("🔍 About to commit batch...");
    
    // Try committing and catch detailed error
    try {
      await batch.commit();
      console.log("✅ Invitation accepted successfully for", invitationId);
    } catch (batchError: any) {
      console.error("❌ Batch commit failed:", batchError);
      
      // Try each update individually to find which one fails
      console.log("🔍 Testing each update individually...");
      
      try {
        console.log("Testing invitation updates...");
        await updateDoc(recRef, { status: "accepted", respondedAt: serverTimestamp() });
        console.log("✅ Recipient invitation updated");
      } catch (e: any) {
        console.error("❌ Failed: recipient invitation", e.message);
      }
      
      try {
        await updateDoc(senderRef, { status: "accepted", respondedAt: serverTimestamp() });
        console.log("✅ Sender invitation updated");
      } catch (e: any) {
        console.error("❌ Failed: sender invitation", e.message);
      }
      
      try {
        await updateDoc(topRef, { status: "accepted", respondedAt: serverTimestamp() });
        console.log("✅ Top-level invitation updated");
      } catch (e: any) {
        console.error("❌ Failed: top-level invitation", e.message);
      }
      
      try {
        await updateDoc(meetupRef, {
          memberIds: arrayUnion(recipientId),
          [`members.${recipientId}`]: {
            joinedAt: serverTimestamp(),
            arrivedAt: null,
            locationSharingEnabled: false,
          },
        });
        console.log("✅ Meetup updated");
      } catch (e: any) {
        console.error("❌ Failed: meetup update", e.message);
      }
      
      try {
        await updateDoc(userRef, { meetupIds: arrayUnion(meetupId) });
        console.log("✅ User updated");
      } catch (e: any) {
        console.error("❌ Failed: user update", e.message);
      }
      
      throw batchError;
    }
    return true;
  } catch (err: any) {
    console.error("❌ Failed to accept invitation:", err);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error message:", err.message);
    alert(`Failed to accept invitation: ${err.message || err}`);
    throw err;
  }
}

/**
 * Reject invitation:
 * - mark as rejected in received, sent, top-level
 */
export async function rejectInvitation({ recipientId, invitationId }: { recipientId: string; invitationId: string; }) {
  const recRef = doc(db, "users", recipientId, "invitationsReceived", invitationId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error("Invitation not found");

  const inv = recSnap.data() as any;
  const senderId = inv.senderId;
  const topRef = doc(db, "invitations", invitationId);
  const senderRef = doc(db, "users", senderId, "invitationsSent", invitationId);

  const batch = writeBatch(db);
  batch.update(recRef, { status: "rejected", respondedAt: serverTimestamp() });
  batch.update(senderRef, { status: "rejected", respondedAt: serverTimestamp() });
  batch.update(topRef, { status: "rejected", respondedAt: serverTimestamp() });
  await batch.commit();
  return true;
}

/**
 * Delete an invitation (sender or recipient can delete their copy)
 * Note: this removes the doc from the specific user's subcollection.
 * You may also want to remove top-level doc or both copies — adapt as needed.
 */
export async function deleteInvitation({ userId, invitationId }: { userId: string; invitationId: string; }) {
  // Attempt to delete from both subcollections and top-level (safe with Promise.allSettled)
  const promises = [
    deleteDoc(doc(db, "users", userId, "invitationsReceived", invitationId)).catch(() => null),
    deleteDoc(doc(db, "users", userId, "invitationsSent", invitationId)).catch(() => null),
    // optionally delete top-level if desired:
    // deleteDoc(doc(db, "invitations", invitationId)).catch(()=>null),
  ];
  await Promise.all(promises);
  return true;
}

/**
 * Utility: is invitation expired (based on sentAt or dateTime)
 */
export function isInvitationExpired(invitation: Invitation): boolean {
  try {
    const dt = invitation.dateTime ? new Date(`${invitation.dateTime}`) : null;
    if (!dt) return false;
    return new Date() > dt;
  } catch {
    return false;
  }
}