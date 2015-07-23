class Changeformat < ActiveRecord::Migration
  def change
  	change_column :shoppe_products, :price, :string
  end
end
