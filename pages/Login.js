function Login({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const result = await login(username, password);
      localStorage.setItem('auth_token', result.objectId);
      localStorage.setItem('user_role', result.objectData.role);
      onLogin(result.objectData.role);
    } catch (error) {
      reportError(error);
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon="fa-sign-in-alt"
          >
            Masuk
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
