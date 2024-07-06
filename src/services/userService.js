import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db, auth } from '../config/firebase';
import { decrypt, encrypt } from '../utils/encryption';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { sendEmail } from '../utils/sendEmail';

export const createUser = async (userData) => {
    const { firstName, middleName, lastName, email } = userData;
    const encryptedPassword = sessionStorage.getItem('password');

    let password;
    const originalUser = auth.currentUser;
    const originalUserEmail = originalUser?.email;

    if (encryptedPassword) {
        password = decrypt(encryptedPassword);
    } else {
        password = prompt('Please re-enter your password for security purposes');
        if (!password) return;
        sessionStorage.setItem('password', encrypt(password));
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), `${lastName.toLowerCase()}-${firstName.toLowerCase()}`);

    await sendEmail({
        to_email: email.trim(),
        subject: 'Smart Bin Account Creation',
        message: `Hi ${firstName.trim()}, please verify your email first! Your password is: ${lastName.toLowerCase()}-${firstName.toLowerCase()}`,
    });

    await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role: 'user',
    });

    await sendEmailVerification(userCredential.user);
    await signInWithEmailAndPassword(auth, originalUserEmail, password);
};
export const handleUserStatusToggle = async (userId, newStatus) => {
    try {
        if (!window.confirm('Are you sure you want to perform this action?')) return;
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            isDisabled: newStatus,
        });
        toast.success('User status updated successfully.');
    } catch (error) {
        console.error('Error updating user status: ', error);
    }
};
