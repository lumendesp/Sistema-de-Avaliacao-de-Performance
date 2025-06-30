import { useState, useEffect } from 'react';
import { getAllUnits, getAllPositions, getTracksWithCriteria, getAllRhCriteria } from '../services/api';

function TestAPI() {
    const [units, setUnits] = useState([]);
    const [positions, setPositions] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const testAPI = async () => {
            try {
                setLoading(true);
                const [unitsData, positionsData, tracksData, criteriaData] = await Promise.all([
                    getAllUnits(),
                    getAllPositions(),
                    getTracksWithCriteria(),
                    getAllRhCriteria()
                ]);
                
                setUnits(unitsData);
                setPositions(positionsData);
                setTracks(tracksData);
                setCriteria(criteriaData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        testAPI();
    }, []);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Teste da API</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold mb-2">Unidades ({units.length})</h3>
                    <ul className="text-sm">
                        {units.map((unit: any) => (
                            <li key={unit.id}>{unit.name}</li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-2">Posições ({positions.length})</h3>
                    <ul className="text-sm">
                        {positions.map((position: any) => (
                            <li key={position.id}>{position.name}</li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-2">Trilhas ({tracks.length})</h3>
                    <ul className="text-sm">
                        {tracks.map((track: any) => (
                            <li key={track.id}>
                                {track.name} - Grupos: {track.CriterionGroup.length}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-2">Critérios ({criteria.length})</h3>
                    <ul className="text-sm">
                        {criteria.map((criterion: any) => (
                            <li key={criterion.id}>{criterion.displayName}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TestAPI; 