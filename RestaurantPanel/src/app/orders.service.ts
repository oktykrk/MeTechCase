import { EventEmitter, Injectable, Output } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { IOrder } from './order.model';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    @Output() public newOrderPlaced = new EventEmitter<IOrder>();
    @Output() public orderStatusUpdated = new EventEmitter<IOrder>();

    constructor(private _httpClient: HttpClient) { }

    public connectHub(): void {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://bsite.net/oktykrk/ordersHub", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            }).build();

        connection.on("NewOrderPlaced", (e) => {
            this.newOrderPlaced.emit(e);
        });
        connection.on("OrderStatusUpdated", (e) => {
            this.orderStatusUpdated.emit(e);
        });

        connection.start();
    }


    public async approveOrder(order: IOrder): Promise<void> {
        await firstValueFrom(this._httpClient.post('https://bsite.net/oktykrk/orders/UpdateOrderStatus', { ...order, status: 'approved' }));
    }

    public async placeOrder(): Promise<IOrder> {
        return await firstValueFrom(this._httpClient.post<IOrder>('https://bsite.net/oktykrk/orders/PlaceOrder', { status: 'approved' }));
    }
}
