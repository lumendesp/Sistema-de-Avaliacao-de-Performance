import { useLocation } from 'react-router-dom';
import { EvaluationTemplate } from '../../../components/Committee/Pdf/EvaluationTemplate';

function PdfView() {
  const { state } = useLocation();
  if (!state) return <div>No data</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <EvaluationTemplate {...state} />
    </div>
  );
}

export default PdfView;
