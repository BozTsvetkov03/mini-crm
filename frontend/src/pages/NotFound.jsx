import notFoundImg from "../assets/not-found.jpg";
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate('');

    return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
            
            <h1 className="text-6xl font-bold text-emerald-600">404</h1>

            <h2 className="mt-4 text-lg text-gray-600 max-w-md">
                We couldn't find the page you were looking for.
            </h2>

            <img
                src={notFoundImg}
                className="mt-8 w-full max-w-2xl object-contain"
                alt="Not found"
            />

            <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-400 transition">
                Go Home
            </button>
        </div>
    );
}

export default NotFound;