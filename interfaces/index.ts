import { OrderStatus } from "@/types";

export interface Order
{
    uuid: string;
    order_number: string;
    bot_uuid?: string;
    status: OrderStatus;
    created_at: Date;
    completed_at?: Date;
    is_vip: boolean;
}

export interface Bot
{
    uuid: string;
    // order_uuid?: string;
    created_at: Date;
}
