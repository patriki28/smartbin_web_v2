import _ from 'lodash';
import moment from 'moment';

export function filterAndAggregateData(binData, binType = 'all_bins', binId = 'all_bins', timeFilter = 'daily') {
    // Filter by bin type if specified
    if (binType !== 'all_bins') {
        binData = binData.filter((entry) => entry.bin_type === binType);
    }

    // Filter by bin ID if specified
    if (binId !== 'all_bins') {
        binData = binData.filter((entry) => entry.bin === binId);
    }

    // Group data based on the time filter
    let groupedData;

    switch (timeFilter) {
        case 'daily':
            groupedData = _.groupBy(binData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM-DD'));
            break;
        case 'weekly':
            groupedData = _.groupBy(binData, (item) =>
                moment(item.timestamp.seconds * 1000)
                    .startOf('week')
                    .format('YYYY-WW')
            );
            break;
        case 'monthly':
            groupedData = _.groupBy(binData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM'));
            break;
        default:
            groupedData = _.groupBy(binData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM-DD'));
    }

    // Calculate the average of the maximum fill levels for each period
    let aggregatedData = [];
    for (const [period, entries] of Object.entries(groupedData)) {
        const maxFillLevels = entries.map((entry) => entry.percentage);
        const avgMaxFillLevel = _.mean(maxFillLevels);
        aggregatedData.push({
            period: period,
            avgMaxFillLevel: avgMaxFillLevel,
        });
    }

    // Sort the data by period
    aggregatedData = _.sortBy(aggregatedData, ['period']);

    // Get data for the last 7 periods
    const last7Periods = aggregatedData.slice(-7);
    // Prepare the result
    const result = {
        labels: last7Periods.map((entry) => entry.period),
        datasets: [
            {
                label: 'Average Waste Fill Levels',
                data: last7Periods.map((entry) => entry.avgMaxFillLevel),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // console.log('Final result:', result);
    return result;
}

export function filterAndGroupData(data, binId, timeFilter) {
    const now = moment();
    let startDate;

    // Determine the start date based on the time filter
    switch (timeFilter) {
        case 'daily':
            startDate = now.clone().subtract(100, 'days');
            break;
        case 'weekly':
            startDate = now.clone().subtract(14, 'weeks');
            break;
        case 'monthly':
            startDate = now.clone().subtract(6, 'months');
            break;
        default:
            startDate = moment(0); // Include all data
    }

    // Filter the data based on binId and time period
    const filteredData = data.filter((item) => {
        const itemDate = moment(item.timestamp.seconds * 1000); // assuming Firestore timestamp
        let include = true;

        // Filter by bin ID
        if (binId && binId !== 'all_bins' && item.bin_id !== binId) {
            include = false;
        }

        // Filter by time period
        if (itemDate.isBefore(startDate)) {
            include = false;
        }

        return include;
    });

    // Group the data by day, week, or month
    let groupedData;
    switch (timeFilter) {
        case 'daily':
            groupedData = _.groupBy(filteredData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM-DD'));
            break;
        case 'weekly':
            groupedData = _.groupBy(filteredData, (item) =>
                moment(item.timestamp.seconds * 1000)
                    .startOf('week')
                    .format('YYYY-WW')
            );
            break;
        case 'monthly':
            groupedData = _.groupBy(filteredData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM'));
            break;
        default:
            groupedData = _.groupBy(filteredData, (item) => moment(item.timestamp.seconds * 1000).format('YYYY-MM-DD'));
    }

    // Calculate the average number of each bin type for each group
    const typeCounts = {
        Dry: [],
        Wet: [],
        Metal: [],
    };

    _.forEach(groupedData, (group) => {
        const counts = _.countBy(group, 'type');
        const groupSize = Object.keys(groupedData).length;

        typeCounts.Dry.push((counts.Dry || 0) / groupSize);
        typeCounts.Wet.push((counts.Wet || 0) / groupSize);
        typeCounts.Metal.push((counts.Metal || 0) / groupSize);
    });

    // Calculate the overall averages
    const dryAverage = _.mean(typeCounts.Dry) || 0;
    const wetAverage = _.mean(typeCounts.Wet) || 0;
    const metalAverage = _.mean(typeCounts.Metal) || 0;

    const values = ['Dry', 'Wet', 'Metal'];
    const averages = [dryAverage, wetAverage, metalAverage];
    return {
        labels: values,
        datasets: [
            {
                label: 'Waste Types',
                data: averages,
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };
}
