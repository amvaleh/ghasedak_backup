class Changeshoppepaymentsamounttype < ActiveRecord::Migration
  def change
  	change_column :shoppe_payments, :amount, :string
  end
end
