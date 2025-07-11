import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchActiveEvaluationCycle, fetchSelfEvaluation } from "../../services/api";
import axios from "axios";
import SelfEvaluationGroupListReadOnly from "../../components/SelfEvaluationForm/SelfEvaluationGroupListReadOnly";
import type { TrackWithGroups } from "../../types/selfEvaluation";

const MentorSelfEvaluationReadOnly = () => {
  const { id } = useParams(); // id do colaborador avaliado na rota
  const [trackGroups, setTrackGroups] = useState<TrackWithGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycleId, setCycleId] = useState<number | null>(null);
  const [selfEval, setSelfEval] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setCycleId(cycle?.id || null);
        if (!id || !cycle?.id) {
          setTrackGroups(null);
          setSelfEval(null);
          setLoading(false);
          return;
        }
        // Busca os dados do colaborador avaliado (não do mentor!)
        const userRes = await axios.get(`http://localhost:3000/users/${id}`);
        const user = userRes.data;
        const userTrack = user?.trackId;
        const userUnit = user?.unitId;
        const userPosition = user?.positionId;
        // Busca todos os tracks
        const res = await axios.get("http://localhost:3000/rh-criteria/tracks/with-criteria");
        const trackData = res.data.find((t: any) => t.id === userTrack);
        // Filtra grupos do track que batem com unit/position
        let filteredGroups = trackData?.CriterionGroup || [];
        if (userUnit && userPosition) {
          filteredGroups = filteredGroups
            .filter((g: any) =>
              g.configuredCriteria.some(
                (cc: any) => cc.unitId === userUnit && cc.positionId === userPosition
              )
            )
            .map((g: any) => ({
              ...g,
              configuredCriteria: g.configuredCriteria.filter(
                (cc: any) => cc.unitId === userUnit && cc.positionId === userPosition
              ),
            }));
        }
        setTrackGroups({ ...trackData, CriterionGroup: filteredGroups } || null);
        // Busca a autoavaliação do colaborador avaliado
        const selfEvalArr = await fetchSelfEvaluation(Number(id));
        let found = null;
        if (Array.isArray(selfEvalArr) && selfEvalArr.length > 0) {
          found = selfEvalArr.find((e: any) => e.cycle?.id === cycle.id);
        } else if (selfEvalArr && selfEvalArr.cycle?.id === cycle.id) {
          found = selfEvalArr;
        }
        // Se não encontrar para o ciclo, mas existe uma, pega a mais recente
        if (!found && Array.isArray(selfEvalArr) && selfEvalArr.length > 0) {
          found = selfEvalArr.reduce((prev: any, curr: any) =>
            prev.cycle?.id > curr.cycle?.id ? prev : curr
          );
        }
        setSelfEval(found || null);
      } catch (e) {
        setTrackGroups(null);
        setSelfEval(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div>Carregando autoavaliação do colaborador...</div>;
  if (!trackGroups || !cycleId || !selfEval)
    return <div>Nenhuma autoavaliação encontrada para este colaborador.</div>;

  return (
    <div className="p-3 bg-[#f1f1f1] mt-0">
      <SelfEvaluationGroupListReadOnly trackData={trackGroups} cycleId={cycleId} selfEval={selfEval} />
    </div>
  );
};

export default MentorSelfEvaluationReadOnly;
