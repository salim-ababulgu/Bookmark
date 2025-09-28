import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { signIn, signUp, signInWithGoogle, resetPassword } from '../services/supabaseAuthService';
import { toast } from 'sonner';
import { Bookmark, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import GoogleAuthHelper from '../components/GoogleAuthHelper';

const AuthPage = () => {
  console.log('📄 AuthPage: Rendu');

  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, initialized } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // États des formulaires
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showGoogleHelper, setShowGoogleHelper] = useState(false);

  console.log('📄 AuthPage - États:', { mode, loading, isAuthenticated, initialized });

  // Redirection après connexion réussie
  useEffect(() => {
    if (initialized && isAuthenticated) {
      console.log('📄 AuthPage: Utilisateur connecté, redirection...');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, initialized, navigate, location.state]);

  // Afficher un loader pendant l'initialisation
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation est requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }

      if (formData.displayName.trim() && formData.displayName.trim().length < 2) {
        newErrors.displayName = 'Le nom doit contenir au moins 2 caractères';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Connexion avec email/password
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    console.log('📄 AuthPage: Début authentification email', { mode });
    console.log('📄 AuthPage: FormData:', formData);

    if (!validateForm()) {
      console.log('📄 AuthPage: Validation échouée');
      return;
    }

    console.log('📄 AuthPage: Validation réussie, début auth...');
    setLoading(true);
    setErrors({});

    try {
      let result;

      console.log('📄 AuthPage: Mode:', mode);
      if (mode === 'login') {
        console.log('📄 AuthPage: Appel signIn...');
        result = await signIn(formData.email, formData.password);
      } else {
        console.log('📄 AuthPage: Appel signUp...');
        result = await signUp(formData.email, formData.password, formData.displayName);
      }

      console.log('📄 AuthPage: Résultat auth:', result);

      if (result.success) {
        const message = mode === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !';
        console.log('📄 AuthPage: Succès -', message);
        toast.success(message);

        // Effacer le formulaire
        setFormData({ email: '', password: '', confirmPassword: '', displayName: '' });
      } else {
        console.error('📄 AuthPage: Erreur auth:', result.error);
        console.error('📄 AuthPage: Error code:', result.code);
        setErrors({ general: result.error });
        toast.error(result.error);
      }
    } catch (error) {
      console.error('📄 AuthPage: Erreur inattendue complète:', error);
      console.error('📄 AuthPage: Unexpected error stack:', error.stack);
      const errorMessage = 'Une erreur inattendue est survenue';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      console.log('📄 AuthPage: Fin de l\'authentification, loading false');
      setLoading(false);
    }
  };

  // Connexion avec Google
  const handleGoogleAuth = async () => {
    console.log('📄 AuthPage: Début authentification Google');

    setLoading(true);
    setErrors({});
    setShowGoogleHelper(false);

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        const message = result.isNewUser ?
          'Compte créé avec succès via Google !' :
          'Connexion Google réussie !';
        toast.success(message);
      } else {
        console.error('📄 AuthPage: Erreur Google:', result.error);

        // Afficher l'aide spécifique si c'est un problème de bloqueur
        if (result.code === 'BLOCKED_BY_CLIENT' || result.code === 'NETWORK_ERROR') {
          setShowGoogleHelper(true);
        }

        setErrors({ general: result.error });
        toast.error(result.error);
      }
    } catch (error) {
      console.error('📄 AuthPage: Erreur Google inattendue:', error);
      const errorMessage = 'Erreur lors de la connexion Google';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      setShowGoogleHelper(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRetry = () => {
    setShowGoogleHelper(false);
    handleGoogleAuth();
  };

  // Réinitialisation du mot de passe
  const handleResetPassword = async () => {
    if (!formData.email.trim()) {
      toast.error('Veuillez saisir votre email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Format d\'email invalide');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(formData.email);

      if (result.success) {
        toast.success('Email de réinitialisation envoyé !');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('📄 AuthPage: Erreur reset password:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Changement de mode
  const toggleMode = () => {
    if (!loading) {
      setMode(mode === 'login' ? 'register' : 'login');
      setErrors({});
      setFormData({ email: '', password: '', confirmPassword: '', displayName: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header avec logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">BookmarkApp</h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Container principal */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {/* Onglets */}
          <div className="flex bg-muted">
            <button
              onClick={() => setMode('login')}
              disabled={loading}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
                mode === 'login'
                  ? 'bg-card text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('register')}
              disabled={loading}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
                mode === 'register'
                  ? 'bg-card text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-destructive text-sm">{errors.general}</p>
              </div>
            )}

            {/* Bouton Google */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Aide Google Auth si nécessaire */}
            {showGoogleHelper && (
              <GoogleAuthHelper
                onRetry={handleGoogleRetry}
                className="mt-4"
              />
            )}

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Nom d'affichage (inscription seulement) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                    Nom d'affichage (optionnel)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                        errors.displayName ? 'border-destructive' : 'border-input'
                      }`}
                      placeholder="Votre nom"
                      disabled={loading}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-destructive text-sm">{errors.displayName}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                      errors.email ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                      errors.password ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              {/* Confirmer mot de passe (inscription seulement) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                        errors.confirmPassword ? 'border-destructive' : 'border-input'
                      }`}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Bouton mot de passe oublié (connexion seulement) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {mode === 'login' ? 'Connexion...' : 'Inscription...'}
                  </div>
                ) : (
                  mode === 'login' ? 'Se connecter' : 'Créer un compte'
                )}
              </button>
            </form>

            {/* Lien pour changer de mode */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;