import { handlers } from "@/lib/auth";

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';


export const { GET, POST } = handlers;