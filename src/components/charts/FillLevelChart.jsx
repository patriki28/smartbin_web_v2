import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import useFetchData from '../../hooks/useFetchData';
import { percentageChartOptions } from '../../utils/chart-options/percentageChartOptions';
import { filterAndAggregateData } from '../../utils/dataUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

export default function FillLevelChart({ selectedBin, selectedWasteType, timePeriod }) {
    const { data } = useFetchData('fill_level_data');

    const chartData = filterAndAggregateData(data, selectedWasteType, selectedBin, timePeriod);

    return (
        <div className="card shadow">
            <div className="card-body">
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-between">
                    <h1 className="text-xl font-semibold">Waste Fill Level</h1>
                </div>
                <Line data={chartData} chartoptions={percentageChartOptions} />
            </div>
        </div>
    );
}
