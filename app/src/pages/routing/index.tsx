import { Route, Routes } from 'react-router-dom';
import { PATHS_CONFIG } from './paths.ts';
import ImageConverter from '../ImageConverter/ImageConverter.tsx';

const {
    home
} = PATHS_CONFIG;

const Routing = () => {
    return (
        <Routes>
            <Route path={home.path} element={<ImageConverter />} />
        </Routes>
    );
};

export default Routing;
