import { useState } from 'react';
import CollaboratorsSearchBar from '../../../components/CollaboratorsSearchBar';
import RHCriteriaBox from '../../../components/RH/RHCriteria/RHCriteriaBox';
import { IoFunnel } from "react-icons/io5";

function RhCriteriaSettings() {
    const [activeTab, setActiveTab] = useState<'track' | 'unit'>('track');

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Critérios de Avaliação</h1>
                <button className="bg-[#08605F] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                    Salvar alterações
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-6">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'track' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('track')}
                >
                    Trilha
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'unit' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('unit')}
                >
                    Unidade
                </button>
            </div>

            {/* Content */}
            {activeTab === 'track' && (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-grow">
                            <CollaboratorsSearchBar />
                        </div>
                        <div className="bg-[#08605F] p-3 rounded-md text-white">
                            <IoFunnel size={24} />
                        </div>
                    </div>
                    {/* Criteria Section */}
                    <RHCriteriaBox
                        trackName="Product Design"
                        criteria={[
                            {
                                name: 'Critérios de Postura',
                                evaluations: [
                                    { name: 'Sentimento de Dono', mandatory: true, weight: 10, description: 'Descrição detalhada do critério Sentimento de Dono...' },
                                    { name: 'Comunicação', mandatory: false, weight: 5, description: 'Descrição detalhada do critério Comunicação...' }
                                ]
                            },
                            {
                                name: 'Critérios Técnicos',
                                evaluations: [
                                    { name: 'Qualidade do Design', mandatory: true, weight: 15, description: 'Descrição detalhada do critério Qualidade do Design...' },
                                ]
                            }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'unit' && (
                <div className="text-center p-8">
                    <h2 className="text-xl text-gray-500">A seção Unidade está em desenvolvimento.</h2>
                </div>
            )}
        </div>
    );
}

export default RhCriteriaSettings;