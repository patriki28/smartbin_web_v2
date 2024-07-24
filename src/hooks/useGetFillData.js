import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { filterAndAggregateData } from '../utils/dataUtils';

export default function useGetFillData({ binType, filter, binId, binData }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unsubscribe = onSnapshot(collection(db, 'fill_level_data'), (querySnapshot) => {
                    const documents = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    const results = filterAndAggregateData(documents, binType, binId, filter);
                    setData(results);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [binType, filter, binId, binData]);

    console.log(data);
    return { data, loading, error };
}
