import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/data/queries";
import type { LibraryItemType } from "@/types";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

function inferFileExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : null;
}

function normalizeType(input: string, file?: File | null): LibraryItemType {
  if (input === "loom" || input === "figma" || input === "link") return input;
  if (input === "screenshot") return "screenshot";
  if (file?.type.startsWith("image/")) return "screenshot";
  return "doc";
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await requireCurrentUser();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const sourceUrl = String(formData.get("sourceUrl") || "").trim();
    const tag = String(formData.get("tag") || "").trim();
    const rawType = String(formData.get("type") || "doc");

    if (!title || !note) {
      return NextResponse.json({ error: "Title and note are required." }, { status: 400 });
    }

    const type = normalizeType(rawType, file);
    let storagePath: string | null = null;
    let mimeType: string | null = null;
    let fileExt: string | null = null;

    if (file && file.size) {
      const admin = createSupabaseAdminClient();
      fileExt = inferFileExt(file.name);
      mimeType = file.type || null;
      storagePath = `${currentUser.slug}/${Date.now()}-${sanitizeFilename(file.name)}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await admin.storage.from("library-files").upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false
      });
      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    const admin = createSupabaseAdminClient();
    const { data: inserted, error } = await admin
      .from("library_items")
      .insert({
        title,
        note,
        type,
        source_url: sourceUrl || null,
        storage_path: storagePath,
        mime_type: mimeType,
        file_ext: fileExt,
        poster_id: currentUser.id
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message ?? "Unable to save drop." }, { status: 500 });
    }

    if (tag) {
      await admin.from("library_item_tags").insert({
        library_item_id: inserted.id,
        tag_id: tag
      });
    }

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
