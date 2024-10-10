import { createRouter, createWebHistory } from 'vue-router'
import UserHome from '../components/UserHome.vue'
import AdminHome from '../components/AdminHome.vue'
import UserLogin from '../components/UserLogin.vue'
import UserLogout from '../components/UserLogout.vue'
import RegisterUser from '../components/RegisterUser.vue'
import ChangeUserPassword from '../components/ChangeUserPassword.vue'
import UpdateUser from '../components/UpdateUser.vue'

import BidSeats from '../components/BidSeats.vue'
import SelectVenue from '../components/SelectVenue.vue'
import SelectMatch from '../components/SelectMatch.vue'
import ManageMatch from '../components/ManageMatch.vue'
import ApproveMatch from '../components/ApproveMatch.vue'
import ManageVenue from '../components/ManageVenue.vue'
import UpdateSeatPrice from '../components/UpdateSeatPrice.vue'
import BidResults from '../components/BidResults.vue'

const routes = [

  {
    path: '/',
    component: UserHome,  // 사용자 기본 레이아웃
    children: [
      { path: 'userlogin', name: 'UserLogin', component: UserLogin },
      { path: 'registeruser', name: 'RegisterUser', component: RegisterUser },
      { path: 'updateuser', name: 'UpdateUser', component: UpdateUser },    
      { path: 'changeuserpassword', name: 'ChangeUserPassword', component: ChangeUserPassword },
      { path: 'userlogout', name: 'UserLogout', component: UserLogout },
      { path: 'selectvenue', name: 'SelectVenueUser', component: SelectVenue },
      { path: 'bidseats', name: 'BidSeats', component: BidSeats },
      { path: 'selectmatchuser', name: 'SelectMatchUser', component: SelectMatch }
    ]
  },

  // 관리자용 경로
  {
    path: '/admin',
    component: AdminHome,  // 관리자 기본 레이아웃
    children: [
      { path: 'adminlogin', name: 'AdminLogin', component: UserLogin },
      { path: 'adminlogout', name: 'AdminLogout', component: UserLogout },
      { path: 'registeradmin', name: 'RegisterAdmin', component: RegisterUser },  
      { path: 'updateadmin', name: 'UpdateAdmin', component: UpdateUser },  
      { path: 'changeadminpassword', name: 'ChangeAdminPassword', component: ChangeUserPassword },  
      { path: 'selectvenueadmin', name: 'SelectVenueAdmin', component: SelectVenue },
      { path: 'selectmatch', name: 'SelectMatch', component: SelectMatch },
      { path: 'bidresults', name: 'BidResults', component: BidResults },
      { path: 'managematch', name: 'ManageMatch', component: ManageMatch },
      { path: 'approvematch', name: 'ApproveMatch', component: ApproveMatch },
      { path: 'managevenue', name: 'ManageVenue', component: ManageVenue },
      { path: 'updateseatprice', name: 'UpdateSeatPrice', component: UpdateSeatPrice }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
