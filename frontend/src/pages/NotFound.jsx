import notFoundImg from "../assets/not-found.jpg";
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate('');

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center transition-colors">

            <h1 className="text-6xl font-bold text-primary-strong">404</h1>

            <h2 className="mt-4 max-w-md text-lg text-ink-muted">
                We couldn't find the page you were looking for.
            </h2>

            <img
                src={notFoundImg}
                className="mt-8 w-full max-w-2xl object-contain"
                alt="Not found"
            />

            <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 bg-primary-strong text-white rounded-lg hover:bg-primary transition">
                Go Home
            </button>
        </div>
    );
}

export default NotFound;