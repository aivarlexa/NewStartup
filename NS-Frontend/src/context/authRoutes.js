export function getDashboardPath(role) {
  return role === 'Client' ? '/client/dashboard' : '/developer/dashboard'
}

export function getLoginPath(role) {
  return role === 'Client' ? '/client/login' : '/developer/login'
}
