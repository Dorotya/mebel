import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="container has-text-centered py-6">
            <div className="loader-container">
        <span className="icon is-large">
          <i className="fas fa-spinner fa-pulse fa-3x"></i>
        </span>
                <p className="mt-3 is-size-5">Загрузка...</p>
            </div>
        </div>
    );
};

export default Loader;