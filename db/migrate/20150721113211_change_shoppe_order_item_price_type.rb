class ChangeShoppeOrderItemPriceType < ActiveRecord::Migration
  def change
  	change_column :shoppe_order_items, :unit_price, :string
  	change_column :shoppe_order_items, :unit_cost_price, :string
  end
end
