import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { filterAndGroupData } from '../utils/dataUtils';

export default function ({ binType, filter, binId, binData }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unsubscribe = onSnapshot(collection(db, 'waste_data'), (querySnapshot) => {
                    const documents = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    const results = filterAndGroupData(documents, binId, filter);
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
