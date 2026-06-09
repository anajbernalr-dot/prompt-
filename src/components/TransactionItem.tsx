import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Transaction } from '../store/useStore';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  transaction: Transaction;
}

export function TransactionItem({ transaction: t }: Props) {
  const date = new Date(t.timestamp);
  const hasDiscount = t.discount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {t.isCombo ? (
          <View style={styles.comboBadge}>
            <Text style={styles.comboText}>COMBO</Text>
          </View>
        ) : null}
        <Text style={styles.productName} numberOfLines={1}>{t.productName}</Text>
        <Text style={styles.meta}>
          {format(date, 'HH:mm', { locale: es })} · {t.cashierId}
          {hasDiscount ? ` · -${t.discount}%` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatCurrency(t.salePrice * t.quantity)}</Text>
        {hasDiscount ? (
          <Text style={styles.originalPrice}>{formatCurrency(t.originalPrice * t.quantity)}</Text>
        ) : null}
        <Text style={[styles.margin, { color: t.netMargin >= 0 ? Colors.accent : Colors.danger }]}>
          {t.netMargin >= 0 ? '+' : ''}{formatCurrency(t.netMargin)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  left: {
    flex: 1,
    marginRight: 10,
  },
  comboBadge: {
    backgroundColor: Colors.primary + '33',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  comboText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: Colors.subtext,
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    color: Colors.subtext,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  margin: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
