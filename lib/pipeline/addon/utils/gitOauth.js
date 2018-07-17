export function oauthURIGenerator(clientId){
  return {
    'gitlab': `/oauth/authorize?client_id=${  clientId  }&response_type=code`,
    'github': `/login/oauth/authorize?client_id=${  clientId  }&response_type=code&scope=repo+admin%3Arepo_hook`
  }
}