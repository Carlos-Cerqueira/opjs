import { FlatList, TouchableOpacity } from 'react-native';
import { CartItem } from '../../types/CartItem';
import {
	Item,
	ProductContainer,
	Action,
	Image,
	QuantityContainer,
	ProductDetails,
	Summary,
	TotalContainer
} from './styles';

import { Text } from '../Text';
import { FormatCurrency } from '../../utils/FormatCurrency';
import { MinusCircle } from '../Icons/MinusCircle';
import { PlusCircle } from '../Icons/PlusCircle';
import { Button } from '../Button';
import { Product } from '../../types/Product';
import { OrderConfirmedModal } from '../OrderConfirmedModal';
import { useState } from 'react';
import { api } from '../../utils/api';

interface CartProps {
	cartItems: CartItem[];
	onAdd: (product: Product) => void;
	onDecrement: (product: Product) => void;
	onConfirmOrder: () => void;
	selectedTable: string;
}

export function Cart({ cartItems, onAdd, onDecrement, onConfirmOrder, selectedTable }: CartProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);


	const total = cartItems.reduce((acc, cartItem) => {
		return acc + cartItem.quantity * cartItem.product.price;
	}, 0);

	async function handleConfirmOrder() {
		setIsLoading(true);

		await api.post('/orders', {
			table: selectedTable,
			products: cartItems.map((cartItem) => ({
				product: cartItem.product._id,
				quantity: cartItem.quantity,
			})),
		});

		setIsLoading(false);
		setIsModalVisible(true);
	}

	function handleOk() {
		onConfirmOrder();
		setIsModalVisible(false);
	}

	return (
		<>
			<OrderConfirmedModal
				visible={isModalVisible}
				onOk={handleOk}
			/>
			{cartItems.length > 0 && (
				<FlatList
					data={cartItems}
					keyExtractor={cartItem => cartItem.product._id}
					showsVerticalScrollIndicator={false}
					style={{ marginBottom: 20, maxHeight: 140 }}
					renderItem={({ item: cartItem }) => (
						<Item>
							<ProductContainer>
								<Image
									source={{
										uri: `http://192.168.0.24:3001/uploads/${cartItem.product.imagePath}`,
									}}
								/>

								<QuantityContainer>
									<Text size={14} color="#666">
										{cartItem.quantity}x
									</Text>
								</QuantityContainer>

								<ProductDetails>
									<Text size={14} weight={600}>{cartItem.product.name}</Text>
									<Text size={14} color="#666" style={{ marginTop: 4 }}>
										{FormatCurrency(cartItem.product.price)}
									</Text>
								</ProductDetails>

							</ProductContainer>
							<Action>
								<TouchableOpacity
									style={{ marginRight: 24 }}
									onPress={() => onAdd(cartItem.product)}
								>
									<PlusCircle />
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => onDecrement(cartItem.product)}
								>
									<MinusCircle />
								</TouchableOpacity>
							</Action>
						</Item>
					)}
				/>
			)}

			<Summary>
				<TotalContainer>
					{cartItems.length > 0  ? (
						<>
							<Text color="#666">Total</Text>
							<Text size={20} weight="600">{FormatCurrency(total)}</Text>
						</>
					) : (
						<Text color="#999">Seu carrinho está vazio</Text>
					)}
				</TotalContainer>
				<Button
					onPress={handleConfirmOrder}
					disabled={cartItems.length === 0}
					loading={isLoading}
				>
					Confirmar Pedido
				</Button>
			</Summary>
		</>
	);
}
