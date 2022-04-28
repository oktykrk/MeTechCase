import { Component, OnInit } from '@angular/core';
import { IOrder } from './order.model';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public migrosOrders: Array<IOrder> = [];
  public restaurantOrders: Array<IOrder> = [];

  constructor(private _ordersService: OrdersService) { }

  public ngOnInit(): void {
    this._ordersService.connectHub();

    this._ordersService.newOrderPlaced.subscribe(order => {
      this.restaurantOrders.push(order);
    });

    this._ordersService.orderStatusUpdated.subscribe(order => {
      const idx = this.migrosOrders.findIndex(o => o.id === order.id);
      this.migrosOrders[idx] = order;
    });
  }

  public async onPlaceOrder(): Promise<void> {
    const order = await this._ordersService.placeOrder();
    this.migrosOrders.push(order);
  }

  public async onOrderApprove(order: IOrder): Promise<void> {
    await this._ordersService.approveOrder(order);

    const idx = this.restaurantOrders.findIndex(o => o.id === order.id);
    this.restaurantOrders[idx] = { ...order, status: 'approved' };
  }
}
