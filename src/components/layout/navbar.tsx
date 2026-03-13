import { getCurrentUser } from "@/lib/auth"
import { NavbarClientLoader } from "./navbar-client-loader"

export async function Navbar() {
  const user = await getCurrentUser()
  return <NavbarClientLoader user={user} />
}
