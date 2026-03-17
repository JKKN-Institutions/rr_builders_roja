import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in route handlers when response already started
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, user: null, clientId: null };

  const clientId = user.app_metadata?.client_id as string | undefined;
  if (!clientId) return { supabase: null, user: null, clientId: null };

  return { supabase, user, clientId };
}
