// lib/services/db/firestore-db.ts
import { 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    DocumentData
  } from "firebase/firestore";
  import { db } from "@/lib/config/firebase";
  import { DBInterface } from "./db-service";
  import { Meetup } from "@/lib/models/meetup";
  import { User } from "@/lib/models/user";
  import { HangoutSpot } from "@/lib/models/hangoutspot";
  
  /**
   * Firestore implementation of database service
   */
  export class FirestoreDBService implements DBInterface {
    // ===== MEETUP OPERATIONS =====
    
    // Create a new meetup and store to Firebase w auto-generated ID
    static async createMeetup(
        title: string,
        dateTime: Date,
        destination: HangoutSpot,
        creator: User
    ): Promise<Meetup> {
        try {
            // Generate a new document reference (with auto-generated ID)
            const meetupRef = doc(collection(db, "meetups"));

            // Create the Meetup object with Firebase ID
            const meetup = new Meetup(
                meetupRef.id,
                title,
                dateTime,
                destination,
                creator
            );

            // Save to Firestore with destination as object
            const memberStatusesObj: Record<string, Omit<MemberStatus, 'userId'>> = {}
            meetup.memberStatuses.forEach((status, userId) => {
                memberStatusesObj[userId] = {
                    status: status.status,
                    locationSharingEnabled: status.locationSharingEnabled,
                    arrivedAt: status.arrivedAt,
                    joinedAt: status.joinedAt
                }
            })

            await setDoc(meetupRef, {
                title: meetup.title,
                dateTime: meetup.dateTime,
                destination: {
                    id: meetup.destination.id,
                    name: meetup.destination.name,
                    category: meetup.destination.category,
                    priceRange: meetup.destination.priceRange,
                    rating: meetup.destination.rating,
                    reviewCount: meetup.destination.reviewCount,
                    coordinates: meetup.destination.coordinates,
                    address: meetup.destination.address,
                    thumbnailUrl: meetup.destination.thumbnailUrl,
                    openingHours: meetup.destination.openingHours,
                },
                creatorId: meetup.creator.id,
                memberIds: meetup.getMemberIds(),
                members: memberStatusesObj,
            });

            console.log("Meetup created with ID:", meetupRef.id);
            return meetup;
        } catch (e) {
            console.error("Error creating meetup:", e);
            throw e;
        }
    }
    
    async getMeetupById(id: string): Promise<Meetup | null> {
        try {
            const meetupRef = doc(db, "meetups", id);
            const meetupSnap = await getDoc(meetupRef);
            return meetupSnap.exists() ? meetupSnap.data() : null;
          } catch (error) {
            console.error("[FIRESTORE] Error getting meetup doc:", error);
            throw error;
          }
    }
  
    async saveMeetup(meetup: Meetup): Promise<void> {
      try {
        console.log("[FIRESTORE] Saving meetup:", meetup.id);
        
        const meetupRef = await getDoc(doc(db, "meetups", meetup.id));
        // Convert member statuses to object
        await setDoc(meetupRef, {
            title: meetup.title,
            dateTime: meetup.dateTime,
            destination: {
                id: meetup.destination.id,
                name: meetup.destination.name,
                category: meetup.destination.category,
                priceRange: meetup.destination.priceRange,
                rating: meetup.destination.rating,
                reviewCount: meetup.destination.reviewCount,
                coordinates: meetup.destination.coordinates,
                address: meetup.destination.address,
                thumbnailUrl: meetup.destination.thumbnailUrl,
                openingHours: meetup.destination.openingHours,
            },
            creatorId: meetup.creator.id,
            memberIds: meetup.getMemberIds(),
            members: memberStatusesObj,
        });

        console.log("Meetup created with ID:", meetupRef.id);
        });
        
        const meetupRef = doc(db, "meetups", meetup.id);
        await setDoc(meetupRef, {
          title: meetup.title,
          dateTime: meetup.dateTime.toISOString(),
          destination: {
            id: meetup.destination.id,
            name: meetup.destination.name,
            category: meetup.destination.category,
            priceRange: meetup.destination.priceRange,
            rating: meetup.destination.rating,
            reviewCount: meetup.destination.reviewCount,
            coordinates: meetup.destination.coordinates,
            address: meetup.destination.address,
            thumbnailUrl: meetup.destination.thumbnailUrl,
            openingHours: meetup.destination.openingHours,
          },
          creatorId: meetup.creator.id,
          memberIds: meetup.getMemberIds(),
          members: memberStatusesObj,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("[FIRESTORE] Error saving meetup:", error);
        throw error;
      }
    }
  
    async deleteMeetup(id: string): Promise<void> {
      try {
        console.log("[FIRESTORE] Deleting meetup:", id);
        const meetupRef = doc(db, "meetups", id);
        await deleteDoc(meetupRef);
      } catch (error) {
        console.error("[FIRESTORE] Error deleting meetup:", error);
        throw error;
      }
    }
  
    async getMeetupDoc(id: string): Promise<DocumentData | null> {
      try {
        const meetupRef = doc(db, "meetups", id);
        const meetupSnap = await getDoc(meetupRef);
        return meetupSnap.exists() ? meetupSnap.data() : null;
      } catch (error) {
        console.error("[FIRESTORE] Error getting meetup doc:", error);
        throw error;
      }
    }
  
    // ===== USER OPERATIONS =====
    
    async getUserById(id: string): Promise<User | null> {
      try {
        console.log("[FIRESTORE] Getting user:", id);
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          return null;
        }
        
        const data = userSnap.data();
        const user = new User(
          userSnap.id,
          data.name,
          data.email,
          data.currentLocation || null
        );
        
        // Load meetups if meetupIds exist
        if (data.meetupIds && data.meetupIds.length > 0) {
          for (const meetupId of data.meetupIds) {
            try {
              const meetup = await this.getMeetupById(meetupId);
              if (meetup) {
                (user as any).meetups.push(meetup);
              }
            } catch (error) {
              console.error(`[FIRESTORE] Failed to load meetup ${meetupId}:`, error);
            }
          }
        }
        
        return user;
      } catch (error) {
        console.error("[FIRESTORE] Error getting user:", error);
        throw error;
      }
    }
  
    async saveUser(user: User): Promise<void> {
      try {
        console.log("[FIRESTORE] Saving user:", user.id);
        const userRef = doc(db, "users", user.id);
        await setDoc(userRef, {
          name: user.name,
          email: user.email,
          currentLocation: user.currentLocation || null,
          meetupIds: user.getMeetupIds(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("[FIRESTORE] Error saving user:", error);
        throw error;
      }
    }
  
    async deleteUser(id: string): Promise<void> {
      try {
        console.log("[FIRESTORE] Deleting user:", id);
        const userRef = doc(db, "users", id);
        await deleteDoc(userRef);
      } catch (error) {
        console.error("[FIRESTORE] Error deleting user:", error);
        throw error;
      }
    }
  
    async getUserDoc(id: string): Promise<DocumentData | null> {
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
      } catch (error) {
        console.error("[FIRESTORE] Error getting user doc:", error);
        throw error;
      }
    }
  
    // ===== QUERY OPERATIONS =====
    
    async getMeetupsByUserId(userId: string): Promise<Meetup[]> {
      try {
        console.log("[FIRESTORE] Getting meetups for user:", userId);
        const meetupsRef = collection(db, "meetups");
        const q = query(meetupsRef, where("memberIds", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        
        const meetups: Meetup[] = [];
        for (const doc of querySnapshot.docs) {
          const meetup = await this.getMeetupById(doc.id);
          if (meetup) {
            meetups.push(meetup);
          }
        }
        
        return meetups;
      } catch (error) {
        console.error("[FIRESTORE] Error getting meetups by user:", error);
        throw error;
      }
    }
  
    async getUsersByMeetupId(meetupId: string): Promise<User[]> {
      try {
        console.log("[FIRESTORE] Getting users for meetup:", meetupId);
        const meetup = await this.getMeetupById(meetupId);
        if (!meetup) {
          return [];
        }
        
        const users: User[] = [];
        for (const memberId of meetup.getMemberIds()) {
          const user = await this.getUserById(memberId);
          if (user) {
            users.push(user);
          }
        }
        
        return users;
      } catch (error) {
        console.error("[FIRESTORE] Error getting users by meetup:", error);
        throw error;
      }
    }
  }