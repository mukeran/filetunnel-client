import alive from './alive'
import user from './user'
import friends from './friend'
import offlineTransfer from './offlineTransfer'

export default {
  alive,
  ...user,
  ...friends,
  ...offlineTransfer
}
