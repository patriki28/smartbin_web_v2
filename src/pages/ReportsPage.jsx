import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useFetchData from '../hooks/useFetchData';
import { toast } from 'react-toastify';
import useTimeCheck from '../hooks/useTimeCheck';
import { useEffect, useState } from 'react';
import Loader from '../components/ui/Loader';
import { sortDate } from '../utils/sortDate';
import { DataGrid } from '@mui/x-data-grid';
import { filterDataBySearchQuery } from '../utils/filter/filterDataBySearchQuery';
import { fillColumnsData } from '../utils/columns/fillColumnsData';
import AlertError from '../components/ui/AlertError';
import { wasteTypeData } from '../mocks/wasteTypeData';
import { analyzeReport } from '../services/reportService';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBin, setSelectedBin] = useState('');
    const [selectedWasteType, setSelectedWasteType] = useState('All');
    const { data: fillLevelsData, loading: fillLevelsLoading } = useFetchData('fill_level_data');
    const { data: wasteData, loading: wasteLoading } = useFetchData('waste_data');
    const { data: binsData, loading: binsLoading } = useFetchData('bins');
    const isButtonDisabled = useTimeCheck();

    useEffect(() => {
        if (binsData && binsData.length > 0) {
            setSelectedBin(binsData[0].id);
        }
    }, [binsData]);

    if (fillLevelsLoading || wasteLoading || binsLoading) return <Loader />;

    const binIds = binsData.map((bin) => bin.id);

    const filteredDataByBins = sortDate(fillLevelsData)
        .filter((item) => item.bin === selectedBin)
        .filter((item) => selectedWasteType === 'All' || item.bin_type === selectedWasteType);

    const filteredWasteDataByBins = sortDate(wasteData)
        .filter((item) => item.bin_id === selectedBin)
        .filter((item) => selectedWasteType === 'All' || item.type === selectedWasteType);

    const fill = filterDataBySearchQuery(filteredDataByBins, searchQuery);
    const waste = filterDataBySearchQuery(filteredWasteDataByBins, searchQuery);

    const handleAnalyzeData = async () => {
        if (loading) return;

        setLoading(true);

        try {
            analyzeReport(fill, waste);
            toast.success('Analyzed data successfully');
        } catch (error) {
            console.error('Error storing timestamp: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-3">Reports and Analytics</h1>
            {binIds.length === 0 ? (
                <AlertError error="No registered bins available. Please add a bin from Bins Page." />
            ) : (
                <>
                    <div className="flex flex-wrap justify-between gap-3 mb-3">
                        <div className="join">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                className="input input-bordered join-item"
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            <select
                                className="select select-bordered join-item"
                                value={selectedBin}
                                onChange={(event) => setSelectedBin(event.target.value)}
                            >
                                {binIds.length === 0 ? (
                                    <option disabled>No bins available</option>
                                ) : (
                                    binIds.map((binId) => (
                                        <option key={binId} value={binId}>
                                            {binId}
                                        </option>
                                    ))
                                )}
                            </select>

                            <select
                                className="select select-bordered join-item"
                                value={selectedWasteType}
                                onChange={(event) => setSelectedWasteType(event.target.value)}
                            >
                                <option value="All">All Types</option>
                                {wasteTypeData.map((waste) => (
                                    <option key={waste} value={waste}>
                                        {waste}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button text="Analyze Reports" loading={loading} onClick={handleAnalyzeData} disabled={loading || isButtonDisabled} />

                            <Link to={`/home/reports/${selectedBin}`} className="btn">
                                View
                            </Link>
                        </div>
                    </div>
                    <DataGrid
                        rows={fill}
                        columns={fillColumnsData}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 20, 30, 40, 50]}
                        autoHeight
                    />
                </>
            )}
        </div>
    );
}
