import { Users } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 text-2xl font-semibold">Team</h1>
      <ComingSoon
        icon={Users}
        title="Team workspace"
        description="Invite teammates, share meetings and collaborate on notes and soundbites together."
      />
    </div>
  );
}
