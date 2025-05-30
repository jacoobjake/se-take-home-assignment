import { Bot, Order } from "@/interfaces";
import React, { createContext } from "react";

type FoodOrderingContextType = {
    orders: Order[];
    pendingOrders: Order[];
    completedOrders: Order[];
    processingOrders: Order[];
    ordersToPickup: Order[];
    bots: Bot[];
    prioritizedBot?: Bot;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setBots: React.Dispatch<React.SetStateAction<Bot[]>>;
    removeBot: (bot_uuid?: string) => void;
};

const noop = () => { };

const defaultContext: FoodOrderingContextType = {
    orders: [],
    pendingOrders: [],
    completedOrders: [],
    processingOrders: [],
    ordersToPickup: [],
    bots: [],
    setOrders: noop as React.Dispatch<React.SetStateAction<Order[]>>,
    setBots: noop as React.Dispatch<React.SetStateAction<Bot[]>>,
    removeBot: noop,
};

export const FoodOrderingContext = createContext<FoodOrderingContextType>(defaultContext);