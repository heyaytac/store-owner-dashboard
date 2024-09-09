'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Trash2, Check } from 'lucide-react'
import { kebabShopMenu } from './menu-data'


export default function KebabStoreOwner() {

const menu = kebabShopMenu;

// Header component
function Header() {
    return (
        <header className="bg-primary text-primary-foreground p-4 text-center">
            <h1 className="text-2xl font-bold">Store Kebab</h1>
        </header>
    )
}

// MenuItem component
const MenuItem = ({ item, addToCart }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>{item.name}</CardTitle>
      <CardDescription> € {item.price.toFixed(2)}</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button onClick={() => addToCart(item)}>Add to Order</Button>
    </CardFooter>
  </Card>
)

// Menu component
const Menu = ({ addToCart }) => (
  <Tabs defaultValue="Kebab" className="w-full">
    <TabsList className="grid w-full grid-cols-5">
      {Object.keys(menu).map((category) => (
        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
      ))}
    </TabsList>
    {Object.entries(menu).map(([category, items]) => (
      <TabsContent key={category} value={category}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MenuItem key={item.id} item={item} addToCart={addToCart} />
          ))}
        </div>
      </TabsContent>
    ))}
  </Tabs>
)

// Cart component
const Cart = ({ cart, removeFromCart }) => (
  <Card>
    <CardHeader>
      <CardTitle>Current Order</CardTitle>
    </CardHeader>
    <CardContent>
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between items-center mb-2">
          <span>{item.name} €{item.price.toFixed(2)}</span>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item)}>Remove</Button>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <strong>Total: €{cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</strong>
    </CardFooter>
  </Card>
)

// OrderForm component
const OrderForm = ({ cart, placeOrder }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickupTime, setPickupTime] = useState('15')

  const handleSubmit = (e) => {
    e.preventDefault()
    placeOrder({ name, phone, pickupTime: parseInt(pickupTime) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Pickup Time</Label>
            <RadioGroup value={pickupTime} onValueChange={setPickupTime} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="15min" />
                <Label htmlFor="15min">15 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="20min" />
                <Label htmlFor="20min">20 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30min" />
                <Label htmlFor="30min">30 min</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" disabled={cart.length === 0}>Place Order</Button>
        </form>
      </CardContent>
    </Card>
  )
}

// OrderList component
const OrderList = ({ orders, deleteOrder, markAsPickedUp }) => (
  <Card>
    <CardHeader>
      <CardTitle>Active Orders</CardTitle>
    </CardHeader>
    <CardContent>
      {orders.map((order) => (
        <Card key={order.id} className="mb-4">
          <CardHeader>
            <CardTitle>{order.name} - {order.phone}</CardTitle>
            <CardDescription>
              Pickup in: {order.remainingTime} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.items.map((item) => (
              <div key={item.id}>{item.name} - ${item.price.toFixed(2)}</div>
            ))}
            <div className="font-bold mt-2">
              Total: ${order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="destructive" onClick={() => deleteOrder(order.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Order
            </Button>
            <Button variant="outline" onClick={() => markAsPickedUp(order.id)}>
              <Check className="mr-2 h-4 w-4" /> Picked Up
            </Button>
          </CardFooter>
        </Card>
      ))}
    </CardContent>
  </Card>
)

// Main App component
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          remainingTime: Math.max(0, order.remainingTime - 1),
        }))
      )
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const addToCart = (item) => {
    setCart([...cart, item])
  }

  const removeFromCart = (item) => {
    setCart(cart.filter((cartItem) => cartItem.id !== item.id))
  }

  const placeOrder = (customerInfo) => {
    const newOrder = {
      id: Date.now(),
      ...customerInfo,
      items: [...cart],
      remainingTime: customerInfo.pickupTime,
    }
    setOrders([...orders, newOrder])
    setCart([])
  }

  const deleteOrder = (orderId) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  const markAsPickedUp = (orderId) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Menu addToCart={addToCart} />
            <div className="mt-8">
              <Cart cart={cart} removeFromCart={removeFromCart} />
            </div>
            <div className="mt-8">
              <OrderForm cart={cart} placeOrder={placeOrder} />
            </div>
          </div>
          <div>
            <OrderList
              orders={orders}
              deleteOrder={deleteOrder}
              markAsPickedUp={markAsPickedUp}
            />
          </div>
        </div>
      </main>
    </div>
  )

}