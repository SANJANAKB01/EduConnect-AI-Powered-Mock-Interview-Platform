'use server'
 
import { db } from "@/firebase/admin"
import { revalidatePath } from "next/cache"
 
export async function updateUserProfile(userId: string, data: { name?: string }) {
  try {
    await db.collection('users').doc(userId).update({
      ...(data.name && { name: data.name }),
    })
    revalidatePath('/')
    revalidatePath('/settings')
    return { success: true, message: "Profile updated successfully!" }
  } catch (e) {
    console.error("Error updating profile:", e)
    return { success: false, message: "Failed to update profile." }
  }
}
 