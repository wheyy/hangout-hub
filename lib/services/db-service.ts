import { doc } from "firebase/firestore";
import { db } from "../config/firebase";

class DB {
    getMeetupFromDB(prod: boolean, id: string) {
        if (prod) {
            return doc(db, "meetups", id);
        } else { // dev
            return
        }
    }


}

// mock export for testing
export const mockMeetups = 
{
    
}