class Changeshoppeordersamountpaid < ActiveRecord::Migration
  def change
  	change_column :shoppe_orders, :amount_paid, :string  	
  end
end
