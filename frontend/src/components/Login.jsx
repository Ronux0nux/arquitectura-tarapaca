"
"

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const { login, isLoading } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      notifyError('Por favor completa todos los campos', 'Error de Login');
      return;
    }
    const result = await login(formData.email, formData.password, formData.rememberMe);
    if (result.success) {
      notifySuccess(`¡Bienvenido ${result.user.name}!`, 'Login Exitoso');
    } else {
      notifyError(result.error, 'Error de Autenticación');
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleRecovery = (e) => {
    e.preventDefault();
    notifyInfo('Se ha enviado un enlace de recuperación a tu email', 'Recuperación de Contraseña');
  // Usuarios de demostración
  const demoUsers = [
    { email: 'admin@aceleratarapaka.cl', password: 'admin123', role: 'Administrador', icon: '👨‍💼' },
    { email: 'supervisor@aceleratarapaka.cl', password: 'super123', role: 'Supervisor', icon: '👨‍🔧' },
    { email: 'empleado@aceleratarapaka.cl', password: 'emp123', role: 'Empleado', icon: '👩‍💻' }
  ];
  const fillDemo = (email, password) => {
    setFormData(prev => ({ ...prev, email, password }));
  };

  return (
  <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/edificiotarapaka.png')" }}>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row bg-black bg-opacity-40 rounded-xl shadow-2xl overflow-hidden">
        {/* Columna izquierda: Welcome Back */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-start p-10 text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome<br />Back</h1>
          <p className="mb-6 text-lg max-w-md">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using</p>
          <div className="flex gap-4 mb-8">
            <a href="#" aria-label="Facebook" className="hover:text-blue-400 text-2xl"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-400 text-2xl"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-400 text-2xl"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube" className="hover:text-red-500 text-2xl"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        {/* Columna derecha: Formulario */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-10">
          <div className="w-full max-w-md bg-white rounded-2xl border border-orange-200 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:shadow-orange-400/40 hover:-translate-y-1">
            <div className="flex justify-center mb-6">
              <img src="/logo512.png" alt="Logo" className="w-20 h-20 rounded-full shadow-lg border-4 border-orange-200 bg-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign in</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
                >
                  Lost your password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'} text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in now'
                )}
              </button>
            </form>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">By clicking on "Sign in now" you agree to <a href="#" className="text-orange-600 underline">Terms of Service</a> | <a href="#" className="text-orange-600 underline">Privacy Policy</a></span>
            </div>
            {/* Demo Users opcional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4 text-center">🧪 Demo Users:</p>
              <div className="space-y-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemo(user.email, user.password)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border"
                  >
                    <span className="mr-2">{user.icon}</span>
                    <span className="font-medium">{user.role}</span>
                    <span className="text-gray-500 ml-2">({user.email})</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Recovery Modal */}
            {showRecovery && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-sm w-full p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Password Recovery</h3>
                  <form onSubmit={handleRecovery}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recovery Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRecovery(false)}
                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
