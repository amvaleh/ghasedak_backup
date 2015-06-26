class CompareController < ApplicationController

  def add_object
    puts session[:object_one].to_s + "//1"
    puts session[:object_two].to_s + "//2"
    if session[:object_one].nil?
      session[:object_one] = params[:product]
      redirect_to :back , :alert => "کالا به لیست مقایسه اضافه شد"
      return
    end
    if session[:object_two].nil?
      session[:object_two] = params[:product]
    else
      session[:object_one] = params[:product]
    end
    redirect_to :back , :alert => "کالا به لیست مقایسه اضافه شد"
  end


  def show

    if session[:object_one].present?
      @product1 = Shoppe::Product.find(session[:object_one])
      @attributes1 = @product1.product_attributes.publicly_accessible.to_a
      @comments1 = Comment.where(:product_id => @product1.id).reverse_order
    end

    if session[:object_two].present?
      @product2 = Shoppe::Product.find(session[:object_two])
      @attributes2 = @product2.product_attributes.publicly_accessible.to_a
      @comments2 = Comment.where(:product_id => @product2.id).reverse_order
    end

  end

end
