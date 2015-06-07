# # class Product < Shoppe::Product
# # 	has_many :comments , :foreign_key => :product_id  
# # end

# require File.join(Gem::Specification.find_by_name("shoppe").gem_dir, 'app/models/shoppe/product')

# Product.class_eval do
#   # ...
#   has_many :comments , :foreign_key => :product_id
# end