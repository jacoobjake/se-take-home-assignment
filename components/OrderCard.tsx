import { Order } from "@/interfaces";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { format } from "date-fns";

export default function OrderCard({ order }: { order: Order; })
{
    return (
        <Card className={`p-6 ${order.is_vip ? "bg-gradient-to-br from-yellow-50 via-[#F5D442] to-yellow-50" : ""}`}>
            <CardHeader>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-[#222222]">Order #{order.order_number}</p>
                        {order.is_vip && <div className="py-2 px-4 rounded-full bg-secondary/80 text-white italic">VIP</div>}
                    </div>
                    <div className={`px-4 py-2 rounded-full w-aut self-start text-white ${order.status === "COMPLETED" ? "bg-green-500" : "bg-blue-600"}`}>
                        {order.status}
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <div>
                    <p><span className="font-semibold">Ordered At:</span> {format(order.created_at, "d MMM yyyy HH:mm:ss")}</p>
                    {order.completed_at && <p><span className="font-semibold">Completed At:</span> {format(order.completed_at, "d MMM yyyy HH:mm:ss")}</p>}
                </div>
            </CardBody>
        </Card>
    );
}