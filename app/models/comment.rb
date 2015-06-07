class Comment < ActiveRecord::Base
	
	attr_accessible :product_id , :user_id , :content

	belongs_to :user
	
	belongs_to :product , class_name: 'Shoppe::Product' 
end
