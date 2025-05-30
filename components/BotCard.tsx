import { FoodOrderingContext } from "@/app/context";
import { Bot } from "@/interfaces";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useContext, useEffect, useMemo, useState } from "react";
import { Bot as BotIcon, BotMessageSquare, X } from 'lucide-react';

type Props = {
    bot: Bot;
};

export default function BotCard({ bot }: Props)
{
    const { prioritizedBot, orders, ordersToPickup, setBots, setOrders, removeBot } = useContext(FoodOrderingContext);
    const [countdown, setCountdown] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);

    const botInfo = useMemo(() =>
    {
        const processingOrder = orders?.find((o) => o?.bot_uuid === bot.uuid && o.status === "PENDING");
        return {
            processingOrder,
        };
    }, [orders, bot]);

    const { processingOrder } = botInfo;

    const priorityOrder = useMemo(() => ordersToPickup.find((o) => o.is_vip), [ordersToPickup]);

    const pickupNewOrder = () =>
    {
        if (prioritizedBot?.uuid === bot.uuid) {
            if (!processingOrder || processingOrder.status === "COMPLETED") {
                const order = ordersToPickup?.at(0);

                if (order) {
                    setOrders((prev) =>
                        prev.map((o) => (order.uuid === o.uuid ? {
                            ...o,
                            bot_uuid: bot.uuid
                        } : o))
                    );
                }
            }
            else if (!processingOrder.is_vip && priorityOrder) {
                // Switch to process priority order first
                setBots((prev) =>
                    prev.map((b) => (bot.uuid === b.uuid ? {
                        ...b,
                        order_uuid: priorityOrder.uuid,
                    } : b))
                );
            }
        }
    };

    const markOrderComplete = () =>
    {
        if (processingOrder) {
            setOrders((prev) => prev.map((o) => o.uuid === processingOrder.uuid ? {
                ...o,
                status: "COMPLETED",
                completed_at: new Date(),
            } : o));
            setProcessedCount((prev) => prev + 1);
        }
    };

    useEffect(() =>
    {
        pickupNewOrder();
    }, [orders]);

    useEffect(() =>
    {
        if (processingOrder && processingOrder.status === "PENDING" && countdown === 0) {
            setCountdown(10);
        }
    }, [processingOrder]);

    useEffect(() =>
    {
        if (countdown === 0) {
            markOrderComplete();
            return undefined;
        }

        const intervalId = setInterval(() =>
        {
            setCountdown(countdown - 1);
        }, 1000);

        return () =>
        {
            clearInterval(intervalId);
        };
    }, [countdown]);

    return (
        <Card className="p-4 relative">
            <CardHeader>
                <div className="flex gap-4 justify-between w-full">
                    <div className="flex gap-3 items-center">
                        <div className={`flex transition-colors items-center justify-center p-2 rounded-full ${countdown > 0 ? "text-white bg-green-400 animate-pulse" : "bg-gray-300"}`}>
                            <BotIcon size={32} />
                        </div>
                        <p className="text-lg font-bold"> {bot.uuid}</p>
                    </div>
                    <div className="rounded-full bg-red-300 w-6 h-6 flex justify-center items-center p-1 hover:cursor-pointer hover:bg-red-500" onClick={() => removeBot(bot.uuid)}>
                        <X color="white" />
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <p className="text-lg pb-4 font-semibold">Successfully processed <span className="text-primary">{processedCount}</span> orders.</p>
                {
                    processingOrder ?
                        <>
                            <p className="text-lg font-normal pb-2">Now processing Order #{processingOrder.order_number}</p>
                            <p>Time remaining: {countdown}</p>
                        </> :
                        <p>Waiting for order to come in...</p>
                }
            </CardBody>
        </Card>
    );
}