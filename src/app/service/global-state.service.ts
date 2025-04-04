import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserData = {
    userData: {
        id: string,
        name: string,
        email: string
    }
};

@Injectable({
  providedIn: 'root' // Service ini bisa diakses di seluruh aplikasi
})
export class GlobalStateService {
  // Buat BehaviorSubject untuk menyimpan state global
  private stateSubject = new BehaviorSubject<UserData | null >(null);

  // Observable untuk di-subscribe oleh komponen lain
  state$ = this.stateSubject.asObservable();

  constructor() {}

  // Method untuk mengupdate state
  setUser(user: UserData) {
    this.stateSubject.next(user);
  }

  // Method untuk mereset state
  resetUser() {
    this.stateSubject.next(null);
  }
}
