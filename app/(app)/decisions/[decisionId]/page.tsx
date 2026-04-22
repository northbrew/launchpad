import { notFound } from "next/navigation";
import { DecisionDetail } from "@/components/decisions/decision-detail";
import { getDecisionById, getTeammate, requireCurrentUser } from "@/lib/data/queries";

export default async function DecisionDetailPage({
  params
}: {
  params: { decisionId: string };
}) {
  const currentUser = await requireCurrentUser();
  const [teammate, decision] = await Promise.all([getTeammate(currentUser.id), getDecisionById(params.decisionId)]);

  if (!decision) {
    notFound();
  }

  return <DecisionDetail currentUser={currentUser} decision={decision} teammate={teammate} />;
}
