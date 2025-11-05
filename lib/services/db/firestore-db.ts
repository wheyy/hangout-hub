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
  import { firestoreDB } from "@/lib/config/firebase";
  import { DBInterface } from "./db-service";
  import { Meetup, MemberStatus } from "@/lib/models/meetup";
  import { User } from "@/lib/models/user";
  import { HangoutSpot } from "@/lib/models/hangoutspot";
  
  /**
   * Firestore implementation of database service
   */
  export class FirestoreDBService implements DBInterface {
    // ===== MEETUP OPERATIONS =====
    async createMeetupId(_meetup: Meetup): Promise<number> {
      // Firestore uses string auto-IDs; this method is a no-op placeholder to satisfy the interface.
      // If needed, switch the interface to string IDs and return the generated doc id instead.
      return Date.now()
    }
    
    // Create a new meetup and store to Firebase w auto-generated ID
    static async createMeetup(
        title: string,
        dateTime: Date,
        destination: HangoutSpot,
        creator: User
    ): Promise<Meetup> {
        try {
            // Generate a new document reference (with auto-generated ID)
            const meetupRef = doc(collection(firestoreDB, "meetups"));

            // Create the Meetup object with Firebase ID
            const meetup = new Meetup(
                meetupRef.id,
                title,
                dateTime,
                destination,
                creator
            );

      // Members statuses are managed by Meetup model; store only memberIds here

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
        // TODO: members are not persisted here; only memberIds
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
            const meetupDoc = await getDoc(doc(firestoreDB, "meetups", id));
            
            if (!meetupDoc.exists()) {
                console.log("Meetup not found");
                return null;
            }
            
            const data = meetupDoc.data();
            const creator = await User.loadFromFirestore(data.creatorId);

            // ✅ Parse dateTime carefully
            let dateTime: Date;
            
            if (data.dateTime instanceof Date) {
            // Already a Date object
            dateTime = data.dateTime;
            } else if (typeof data.dateTime === 'string') {
            // ISO string
            dateTime = new Date(data.dateTime);
            } else if (data.dateTime?.seconds) {
            // Firestore Timestamp
            dateTime = new Date(data.dateTime.seconds * 1000);
            } else {
            console.error(`❌ Invalid dateTime format:`, data.dateTime);
            return null;
            }
            
            // ✅ Validate the date
            if (isNaN(dateTime.getTime())) {
            console.error(`❌ Invalid date after parsing:`, data.dateTime);
            throw new Error("Invalid date format");
            }
            
            console.log("✅ Parsed dateTime:", dateTime);

            if (!creator) {
                console.error(`❌ Creator ${data.creatorId} not found`);
                throw new Error("Creator not found");
            }

            // Parse destination as HangoutSpot
            const destinationData = data.destination
            const destination = new HangoutSpot(
                destinationData.id,
                destinationData.name,
                destinationData.category,
                destinationData.priceRange,
                destinationData.rating,
                destinationData.reviewCount,
                destinationData.coordinates,
                destinationData.address,
                destinationData.thumbnailUrl,
                destinationData.openingHours
            )

            const meetup = new Meetup(
                meetupDoc.id,
                data.title,
                dateTime,
                destination,
                creator!
            );
            
            // Load member statuses
            if (data.members) {
                Object.entries(data.members).forEach(([userId, statusData]: [string, any]) => {
                    meetup.setMemberStatus(userId, {
                        userId,
                        status: statusData.status || "traveling",
                        locationSharingEnabled: statusData.locationSharingEnabled ?? true,
                        arrivedAt: statusData.arrivedAt || null,
                        joinedAt: statusData.joinedAt
                    })
                })
            }
            
            // Fetch users from user db
            data.memberIds.forEach(async (memberId: string) => {
                if (memberId !== meetup.creator.id) {
                    const member = await User.loadFromFirestore(memberId);
                    if (member) {
                        meetup.addMemberWithoutStatus(member);
                    }
                }
            });
            
            return meetup;
        } catch (e) {
            console.error(" [FIRESTORE] Error loading meetup:", e);
            return null;
        }
    }
  
    async saveMeetup(meetup: Meetup): Promise<boolean> {
        try {
            const memberStatusesObj: Record<string, Omit<MemberStatus, 'userId'>> = {}
            meetup.getAllMemberStatuses().forEach((status, userId) => {
                memberStatusesObj[userId] = {
                    status: status.status,
                    locationSharingEnabled: status.locationSharingEnabled,
                    arrivedAt: status.arrivedAt,
                    joinedAt: status.joinedAt
                }
            })

            console.log("Updating meetup in Firestore:", meetup.id);
            console.log("Members:", meetup.getMemberIds());
            await updateDoc(doc(firestoreDB, "meetups", meetup.id), {
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
                memberIds: meetup.getMemberIds(),
                members: memberStatusesObj,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
        console.error("[FIRESTORE] Error saving meetup:", error);
        throw error;
      }
    }
  
    async deleteMeetup(id: string): Promise<boolean> {
      try {
        console.log("[FIRESTORE] Deleting meetup:", id);
        await deleteDoc(doc(firestoreDB, "meetups", id));
        return true;
      } catch (error) {
        console.error("[FIRESTORE] Error deleting meetup:", error);
        throw error;
      }
      
    }
  
    async getMeetupDoc(id: string): Promise<DocumentData | null> {
      try {
        const meetupRef = doc(firestoreDB, "meetups", id);
        const meetupSnap = await getDoc(meetupRef);
        return meetupSnap.exists() ? meetupSnap.data() : null;
      } catch (error) {
        console.error("[FIRESTORE] Error getting meetup doc:", error);
        throw error;
      }
    }
  
    // ===== USER OPERATIONS =====
    async createUser(user: User): Promise<void> {
      try {
        console.log("[FIRESTORE] Creating user:", user.id);
        const userRef = doc(firestoreDB, "users", user.id);
        await setDoc(userRef, {
          name: user.name,
          email: user.email,
          currentLocation: user.currentLocation || null,
          meetupIds: user.getMeetupIds?.() ? user.getMeetupIds() : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[FIRESTORE] Error creating user:", error);
        throw error;
      }
    }
    
    async getUserById(id: string): Promise<User | null> {
      try {
        console.log("[FIRESTORE] Getting user:", id);
        const userRef = doc(firestoreDB, "users", id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return null;
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

    async getUserByIdFull(id: string): Promise<User | null> {
      try {
        console.log("[FIRESTORE] Getting full user:", id);
        const userRef = doc(firestoreDB, "users", id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return null;
        const data = userSnap.data();
        const user = new User(
          userSnap.id,
          data.name,
          data.email,
          data.currentLocation || null
        );
        const ids: string[] = Array.isArray(data.meetupIds) ? data.meetupIds : []
        if (ids.length > 0) {
          const constructed: Meetup[] = []
          for (const mid of ids) {
            try {
              const meetup = await this.getMeetupById(mid)
              if (meetup) constructed.push(meetup)
            } catch {
              // ignore individual meetup load failures
            }
          }
          ;(user as any).meetups = constructed
        }
        return user
      } catch (error) {
        console.error("[FIRESTORE] Error getting full user:", error);
        throw error;
      }
    }
  
    async saveUser(user: User): Promise<void> {
      try {
        console.log("[FIRESTORE] Saving user:", user.id);
        const userRef = doc(firestoreDB, "users", user.id);
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
        const userRef = doc(firestoreDB, "users", id);
        await deleteDoc(userRef);
      } catch (error) {
        console.error("[FIRESTORE] Error deleting user:", error);
        throw error;
      }
    }
  
    async getUserDoc(id: string): Promise<DocumentData | null> {
      try {
        const userRef = doc(firestoreDB, "users", id);
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
        const meetupsRef = collection(firestoreDB, "meetups");
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