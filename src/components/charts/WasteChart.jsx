import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useFetchData from '../../hooks/useFetchData';
import { percentageChartOptions } from '../../utils/chart-options/percentageChartOptions';
import { filterAndGroupData } from '../../utils/dataUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WasteChart({ selectedBin, timePeriod }) {
    const { data } = useFetchData('waste_data');

    const chartData = filterAndGroupData(data, selectedBin, timePeriod);

    return (
        <div className="card shadow">
            <div className="card-body">
                <h1 className="text-xl font-semibold">Waste Type Average</h1>
                <Bar data={chartData} chartoptions={percentageChartOptions} />
            </div>
        </div>
    );
}
