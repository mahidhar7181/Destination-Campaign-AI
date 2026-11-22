import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import EngineSettingsModal from './components/EngineSettingsModal';
import ImageModal from './components/ImageModal';
import CampaignModal from './components/CampaignModal';

// Pages
import LandingPage from './pages/LandingPage';
import GeneratorStudio from './pages/GeneratorStudio';
import MyGallery from './pages/MyGallery';
import CampaignManager from './pages/CampaignManager';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState('landing');

  // Global Lightbox & Campaign Attachment State
  const [previewImage, setPreviewImage] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [preselectedImageId, setPreselectedImageId] = useState(null);

  // Iteration / Pre-filled prompt for studio
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioDestination, setStudioDestination] = useState('');

  const handleOpenPreview = (image) => {
    setPreviewImage(image);
  };

  const handleAttachCampaign = (image) => {
    setPreselectedImageId(image.id);
    setCampaignModalOpen(true);
  };

  const handleRerunPrompt = (promptText, destText) => {
    setStudioPrompt(promptText);
    setStudioDestination(destText);
    setActivePage('studio');
  };

  const isInternalPage = ['studio', 'gallery', 'campaigns', 'dashboard'].includes(activePage);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Sticky Modern Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar on internal app pages if authenticated or in studio */}
        {isInternalPage && (
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        )}

        <main className="flex-1 w-full overflow-x-hidden">
          {activePage === 'landing' && (
            <LandingPage 
              setActivePage={setActivePage} 
              onOpenImagePreview={handleOpenPreview} 
            />
          )}

          {activePage === 'studio' && (
            <GeneratorStudio
              onOpenImagePreview={handleOpenPreview}
              onAttachCampaign={handleAttachCampaign}
              initialPrompt={studioPrompt}
              initialDestination={studioDestination}
            />
          )}

          {activePage === 'gallery' && (
            <MyGallery
              onOpenImagePreview={handleOpenPreview}
              onAttachCampaign={handleAttachCampaign}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'campaigns' && (
            <CampaignManager
              onOpenImagePreview={handleOpenPreview}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'dashboard' && (
            <Dashboard
              setActivePage={setActivePage}
              onOpenImagePreview={handleOpenPreview}
              onRerunPrompt={handleRerunPrompt}
            />
          )}

          {activePage === 'login' && (
            <LoginPage setActivePage={setActivePage} />
          )}

          {activePage === 'register' && (
            <RegisterPage setActivePage={setActivePage} />
          )}
        </main>
      </div>

      {/* Global Image Lightbox Modal */}
      <ImageModal
        image={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        onImageUpdated={(updated) => setPreviewImage(updated)}
      />

      {/* Global Campaign Create Modal */}
      <CampaignModal
        isOpen={campaignModalOpen}
        onClose={() => {
          setCampaignModalOpen(false);
          setPreselectedImageId(null);
        }}
        preselectedImageId={preselectedImageId}
      />

      {/* AI Diffusion Engine Settings Modal */}
      <EngineSettingsModal />

      {/* Notification Toast Container */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
