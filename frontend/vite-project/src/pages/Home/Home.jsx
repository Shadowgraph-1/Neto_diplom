import React, { useState } from 'react';
import LoginModal from '../../components/LoginModal/LoginModal';
import Navigation from '../../components/Navigation/Navigation';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const navigate = useNavigate();
  
  const handleRegister = () => {
    navigate('/registration');
  };

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 selection:bg-[#d4af37] selection:text-black pt-20">
      <Navigation />
      <div className="max-w-5xl w-full py-10 relative">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center flex flex-col items-center relative z-0">
          
          <h1 className="text-7xl md:text-[120px] font-black tracking-[-0.05em] leading-none mb-24 bg-gradient-to-b from-white via-[#d4af37] to-gray-600 bg-clip-text text-transparent uppercase">
            My Cloud
          </h1>

          <div className="flex flex-col gap-6 md:gap-4 mb-32">
            {['Безопасное хранилище', 'Мгновенный доступ', 'Ваш цифровой мир'].map((text, index) => (
              <span 
                key={index} 
                className="text-lg md:text-xl text-gray-500 font-medium uppercase tracking-[0.6em] hover:text-[#d4af37] transition-colors duration-700 cursor-default"
              >
                {text}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <button 
              className="group relative w-full py-6 bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#f4d03f] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              onClick={handleRegister}
            >
              Создать аккаунт
            </button>
            
            <button 
              onClick={toggleModal}
              className="w-full py-6 bg-transparent text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] border-2 border-[#3a3a3a] hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
            >
              Войти в систему
            </button>
          </div>

          {modalIsOpen && (
            <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
                onClick={toggleModal}
              />
              <div className="relative z-10 w-full max-w-md transform transition-all scale-100">
                <LoginModal onClose={() => setModalIsOpen(false)} />
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default Home;