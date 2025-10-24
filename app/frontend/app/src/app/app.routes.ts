import { Routes } from '@angular/router';
import { LoginComponent } from './components/forms/login-component/login-component';
import { RegisterComponent } from './components/forms/register-component/register-component';
import { TProfileComponent } from './components/tourist/t-profile-component/t-profile-component';
import { OProfileComponent } from './components/o-profile-component/o-profile-component';
import { TVikendicaComponent } from './components/tourist/t-vikendica-component/t-vikendica-component';
import { LayoutComponent } from './components/layout-component/layout-component';
import { TReservationsComponent } from './components/tourist/t-reservations-component/t-reservations-component';

export const routes: Routes = [
    {path: "", component: LoginComponent},
    {path: "register", component: RegisterComponent},

    //{path: "touristProfile", component: TProfileComponent},
    //{path: "touristVikendica", component: TVikendicaComponent},

    {path: "ownerProfile", component: OProfileComponent},

    {
    path: '',
    component: LayoutComponent,
    children: [
        {path: "touristProfile", component: TProfileComponent},
        {path: "touristVikendica", component: TVikendicaComponent},
        { path: "touristReservation", component: TReservationsComponent},
        { path: '', redirectTo: '/profil', pathMatch: 'full' }
    ]
  }

];
