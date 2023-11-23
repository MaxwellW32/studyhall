"use server"

import { usableDb } from "@/db/index";
import * as schema from "@/db/schema"

export default async function deleteAll() {
    return
    console.log(`$deleted all`);
    await usableDb.delete(schema.posts);
    await usableDb.delete(schema.comments);
    await usableDb.delete(schema.replies);
}