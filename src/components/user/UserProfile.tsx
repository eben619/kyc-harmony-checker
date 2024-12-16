import { User } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => (
  <div className="flex flex-row items-center gap-4">
    <Avatar className="h-16 w-16">
      <AvatarImage src={user?.user_metadata?.avatar_url} />
      <AvatarFallback>
        {user?.email?.charAt(0).toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
    <div>
      <h2 className="text-xl font-semibold">{user?.email}</h2>
      <p className="text-sm text-muted-foreground">
        Member since {new Date(user?.created_at || "").toLocaleDateString()}
      </p>
    </div>
  </div>
);

export default UserProfile;