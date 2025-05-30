"use client";

import BotCard from "@/components/BotCard";
import OrderCard from "@/components/OrderCard";
import { Bot, Order } from "@/interfaces";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useMemo, useState } from "react";
import { v4 } from "uuid";
import { FoodOrderingContext } from "./context";
import { Bot as BotIcon, ClipboardList } from "lucide-react";
import { OrderStatus } from "@/types";
import { DatePicker } from "@heroui/date-picker";

type OrderFilter = {
  orderNo: string;
  orderStatus: OrderStatus | "";
};

const defaultFilter: OrderFilter = {
  orderNo: "",
  orderStatus: "",
};

export default function Home()
{
  const [orders, setOrders] = useState<Order[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>(defaultFilter);

  const removeBot = (uuid?: string) =>
  {
    setBots((prevBots) =>
    {
      const bot = uuid ? prevBots.find((b) => b.uuid === uuid) : prevBots.at(prevBots.length - 1);

      if (!bot) {
        return prevBots;
      }

      // Check if the bot is processing any order
      const inProcessOrder = orders.find((o) => o.bot_uuid === bot.uuid);

      if (inProcessOrder) {
        setOrders((prevOrders) => prevOrders.map((o) => o.uuid === inProcessOrder.uuid ? {
          ...o,
          bot_uuid: undefined,
        } : o));
      }

      return prevBots.filter((b) => b.uuid !== bot.uuid);
    });
  };

  const addBot = () =>
  {
    const newBot = {
      uuid: v4(),
      created_at: new Date(),
    };
    setBots(prev => [...prev, newBot]);
  };

  const addOrder = (is_vip: boolean) =>
  {
    const order_number = `OD${(orders.length + 1).toString().padStart(8, "0")}`;

    setOrders((prev) =>
    {
      const orders: Order[] = [
        ...prev,
        {
          uuid: v4(),
          is_vip,
          order_number,
          status: "PENDING",
          created_at: new Date(),
        }
      ];

      orders.sort((a, b) =>
      {
        if (a.is_vip && !b.is_vip) {
          return -1;
        }
        if (b.is_vip && !a.is_vip) {
          return 1;
        }
        return a.created_at > b.created_at ? 1 : -1;
      });
      return orders;
    });
  };

  const foodOrderingInfo = useMemo(() =>
  {
    const processingOrderUuids: string[] = orders.reduce((prev, order): string[] =>
    {
      if (order.bot_uuid && order.status === "PENDING") {
        return [
          ...prev,
          order.uuid
        ];
      }
      return prev;
    }, []);

    // Group orders
    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    const processingOrders = orders.filter((o) => processingOrderUuids.includes(o.uuid));
    const ordersToPickup = pendingOrders.filter((o) => !processingOrderUuids.includes(o.uuid));
    // Get prioritized bot
    const botsProcessingOrders: string[] = orders?.reduce(
      (prev, o): string[] => o.bot_uuid && o.status === "PENDING" ? [...prev, o.bot_uuid] : prev, []
    );

    const prioritizedBot = bots?.sort(
      (a, b) => (a.created_at.getTime() - b.created_at.getTime())
    ).find((b) => !botsProcessingOrders.includes(b.uuid));

    return {
      completedOrders,
      pendingOrders,
      processingOrders,
      ordersToPickup,
      bots,
      orders,
      prioritizedBot,
      setBots,
      setOrders,
      removeBot,
    };
  }, [orders, bots, orderFilter]);

  const updateFilter = (key: keyof OrderFilter, val: string) =>
  {
    setOrderFilter((prev) => ({
      ...prev,
      [key]: val
    }));
  };

  const orderNoMatch = (order: Order) =>
  {
    const { orderNo } = orderFilter;
    if (orderNo) {
      const regex = new RegExp(`.*${orderNo}.*`);
      return order.order_number.match(regex);
    }

    return true;
  };

  return (
    <FoodOrderingContext.Provider value={foodOrderingInfo}>
      <section className="flex flex-col justify-start gap-4 py-8 md:py-10">
        <div className="grid grid-cols-2 gap-8 p-8 rounded-2xl border-4 bg-primary-content">
          <div className="flex justify-start gap-8 items-center">
            <p className="text-2xl font-bold">Bot List</p>
            <div className="rounded-full bg-green-400 text-white justify-center flex px-4 py-2 items-center gap-2 min-w-20">
              <BotIcon />
              {bots.length}
            </div>
          </div>
          <div className="flex justify-end items-center gap-4">
            <Button variant="ghost" color="primary" onPress={() => addBot()}>Add Bot</Button>
            <Button variant="ghost" color="danger" onPress={() => removeBot()}>Remove Bot</Button>
          </div>
          <div className="col-span-2 max-h-[30vh] overflow-auto">
            <div className="grid grid-cols-2 gap-6 p-6">
              {
                bots.length === 0 ?
                  <p>No bots created</p> :
                  bots.map((b) => <BotCard key={b.uuid} bot={b} />)
              }
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 p-8 rounded-2xl border-4">
          <div className="flex justify-start gap-8 items-center">
            <p className="text-2xl font-bold">Order List</p>
            <div className="rounded-full bg-green-400 text-white justify-center flex px-4 py-2 items-center gap-2 min-w-20">
              <ClipboardList />
              {orders.length}
            </div>
          </div>
          <div className="flex justify-end items-center gap-4">
            <Button variant="ghost" color="primary" onPress={() => addOrder(false)}>Add Normal Order</Button>
            <Button variant="ghost" color="secondary" onPress={() => addOrder(true)}>Add VIP Order</Button>
          </div>
          <div className="w-full col-span-2 rounded-lg border-4 p-4 bg-white">
            <div className="flex justify-between">
              <p className="text-lg font-semibold pb-4">Filters</p>
              <Button variant="ghost" onPress={() => setOrderFilter(defaultFilter)}>Clear Filters</Button>
            </div>
            <div className="grid grid-cols-4">
              <Input
                label={<p className="font-bold">Order No</p>}
                labelPlacement="outside"
                placeholder="Search by order no."
                value={orderFilter.orderNo}
                onChange={(e) => updateFilter('orderNo', e.target.value)}
                classNames={{
                  inputWrapper: ["rounded-md"]
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-8 border-3 p-6 rounded-xl">
            <p className="text-xl font-semibold">Pending Orders</p>
            {
              foodOrderingInfo.pendingOrders.length === 0 ? <p>No Pending Orders</p> : foodOrderingInfo.pendingOrders.filter((o) => orderNoMatch(o)).map((o) => (<OrderCard key={o.uuid} order={o} />))
            }
          </div>
          <div className="flex flex-col gap-8 border-3 p-6 rounded-xl">
            <p className="text-xl font-semibold">Completed Orders</p>
            {
              foodOrderingInfo.completedOrders.length === 0 ? <p>No Completed Orders</p> : foodOrderingInfo.completedOrders.filter((o) => orderNoMatch(o)).map((o) => (<OrderCard key={o.uuid} order={o} />))
            }
          </div>
        </div>
      </section>
    </FoodOrderingContext.Provider>
  );
}
